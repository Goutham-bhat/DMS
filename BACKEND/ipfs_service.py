import os
from dotenv import load_dotenv
import subprocess
import tempfile
import shutil
import requests

# -------------------------
# Configure IPFS storage folder
# -------------------------
IPFS_FOLDER = r"C:\Users\gouth\Desktop\IPFSSTORE"
os.makedirs(IPFS_FOLDER, exist_ok=True)
os.environ["IPFS_PATH"] = IPFS_FOLDER

# -------------------------
# Initialize IPFS repo
# -------------------------
def init_ipfs():
    """Initialize IPFS repo if not already initialized"""
    try:
        subprocess.run(
            ["ipfs", "init"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print("[IPFS] Repo initialized")
    except subprocess.CalledProcessError:
        print("[IPFS] IPFS repo already initialized")

# -------------------------
# Start IPFS daemon in background
# -------------------------
def start_ipfs_daemon():
    """Start IPFS daemon programmatically"""
    try:
        subprocess.Popen(
            ["ipfs", "daemon"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        print("[IPFS] Daemon started")
    except Exception as e:
        print(f"[IPFS] Failed to start daemon: {e}")

# -------------------------
# Add a file to IPFS
# -------------------------
def add_file_to_ipfs(file_path: str) -> str:
    """Add a file to IPFS, pin it, and return its CID"""
    try:
        result = subprocess.run(
            ["ipfs", "add", "-Q", file_path],
            capture_output=True,
            text=True,
            check=True
        )
        cid = result.stdout.strip()

        # Pin the file so it persists
        subprocess.run(
            ["ipfs", "pin", "add", cid],
            check=True,
            capture_output=True,
            text=True
        )

        print(f"[IPFS] File added and pinned. CID: {cid}")
        return cid
    except subprocess.CalledProcessError as e:
        print(f"[IPFS] Error adding file: {e.stderr}")
        return None

# -------------------------
# Remove a file from IPFS
# -------------------------
def remove_file_from_ipfs(cid: str):
    """Safely unpin a file and run garbage collection"""
    if not cid:
        print("[IPFS] No CID provided for removal")
        return

    try:
        subprocess.run(
            ["ipfs", "pin", "rm", cid],
            check=True,
            capture_output=True,
            text=True
        )
        print(f"[IPFS] Unpinned CID: {cid}")
    except subprocess.CalledProcessError as e:
        print(f"[IPFS] Could not unpin CID {cid}: {e.stderr}")

    try:
        result = subprocess.run(
            ["ipfs", "repo", "gc"],
            capture_output=True,
            text=True,
            check=True
        )
        removed_cids = [line.strip() for line in result.stdout.splitlines()]
        if cid in removed_cids:
            print(f"[IPFS] Successfully garbage collected CID: {cid}")
        else:
            print(f"[IPFS] CID {cid} unpinned but not found in GC results")
    except subprocess.CalledProcessError as e:
        print(f"[IPFS] Garbage collection failed: {e.stderr}")

# -------------------------
# Fetch a file from IPFS
# -------------------------
def get_file_from_ipfs(cid: str, filename: str) -> str:
    """
    Fetch a file from IPFS and save it locally in a temporary folder.
    Returns the local path to the file.
    Tries local IPFS first, then falls back to a public gateway.
    """
    if not cid:
        raise ValueError("CID must be provided to fetch a file from IPFS")

    temp_dir = tempfile.mkdtemp(prefix="ipfs_")
    local_path = os.path.join(temp_dir, filename)

    try:
        # Try local IPFS node first
        subprocess.run(
            ["ipfs", "get", cid, "-o", local_path],
            check=True,
            capture_output=True,
            text=True
        )
        print(f"[IPFS] File fetched locally and saved to {local_path}")
        return local_path
    except subprocess.CalledProcessError as e:
        print(f"[IPFS] Local fetch failed: {e.stderr}")
        # Clean up temp dir and try gateway
        shutil.rmtree(temp_dir, ignore_errors=True)

    # Fallback: fetch from public gateway
    try:
        temp_dir = tempfile.mkdtemp(prefix="ipfs_")
        local_path = os.path.join(temp_dir, filename)
        url = f"https://ipfs.io/ipfs/{cid}"
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        with open(local_path, "wb") as f:
            f.write(response.content)

        print(f"[IPFS] File fetched from gateway and saved to {local_path}")
        return local_path
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise RuntimeError(f"Failed to fetch file from IPFS or gateway: {e}") from e
